import { PrismaService } from '@/prisma/prisma.service';
import { EntityNotFoundException } from '@/common/exceptions/entity-not-found.exception';
import { ConflictException } from '@/common/exceptions/conflict.exception';
import { Injectable, Logger } from '@nestjs/common';
import { ApiFeatures } from './api-features';
import { ImageHooks } from './upload-hooks.interface';

type PrismaModelDelegate = {
  findMany: Function;
  findUnique: Function;
  create: Function;
  update: Function;
  delete: Function;
  count: Function;
};

@Injectable()
export abstract class BaseFactory<T> {
  protected abstract model: PrismaModelDelegate;
  protected imageHooks?: ImageHooks;
  protected readonly logger = new Logger(BaseFactory.name);

  constructor(protected readonly prisma: PrismaService) {}

  //  Get All
  async findAll(query?: any): Promise<{ data: T[]; pagination: any }> {
    const api = new ApiFeatures(query)
      .filter()
      .search(['name', 'city'])
      .sort()
      .limitFields()
      .paginate();

    const total = await this.model.count({ where: api.filters });
    const data = await this.model.findMany({
      where: api.filters,
      skip: api.skip,
      take: api.take,
      orderBy: api.orderBy,
      select: api.select,
    });

    return { data, pagination: api.buildPagination(total ?? 0) };
  }

  //  Get One
  async findOne(id: string): Promise<T> {
    const entity = await this.model.findUnique({ where: { id } });
    if (!entity) throw new EntityNotFoundException(this.modelName, id);
    return entity;
  }

  //  Create
  async create(data: any): Promise<T> {
    try {
      const processedData = await this.beforeCreate(data);
      return this.model.create({ data: processedData });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('Unique constraint failed');
      }
      throw err;
    }
  }

  //  Update (handles image replacement)
  async update(id: string, data: any, files?: any): Promise<T> {
    const entity = await this.model.findUnique({ where: { id } });
    if (!entity) throw new EntityNotFoundException(this.modelName, id);

    const processedData = await this.beforeUpdate(data, entity, files);
    const updated = await this.model.update({
      where: { id },
      data: processedData,
    });
    await this.afterUpdate(entity, updated, files);

    return updated;
  }

  //  Delete with cleanup
  async delete(id: string): Promise<void> {
    const entity = await this.model.findUnique({ where: { id } });
    if (!entity) throw new EntityNotFoundException(this.modelName, id);

    await this.model.delete({ where: { id } });
    await this.afterDelete(entity);
  }

  // ─────────────── HOOKS (for overrides) ───────────────

  protected async beforeCreate(data: any): Promise<any> {
    return data;
  }

  protected async beforeUpdate(
    data: any,
    entity: any,
    files?: any,
  ): Promise<any> {
    // Example: detect image fields
    if (this.imageHooks?.singleImageField && files?.file) {
      data[this.imageHooks.singleImageField] = files.file.path;
    }

    if (this.imageHooks?.multipleImagesField && files?.images) {
      data[this.imageHooks.multipleImagesField] = files.images.map(
        (f: any) => f.path,
      );
    }

    return data;
  }

  protected async afterUpdate(
    oldEntity: any,
    newEntity: any,
    files?: any,
  ): Promise<void> {
    if (!this.imageHooks) return;

    const { singleImageField, multipleImagesField } = this.imageHooks;

    // Remove old images if new ones uploaded
    if (singleImageField && files?.file && oldEntity[singleImageField]) {
      await this.cleanupOldImage(oldEntity[singleImageField]);
    }

    if (
      multipleImagesField &&
      files?.images &&
      oldEntity[multipleImagesField]?.length
    ) {
      await this.cleanupOldImages(oldEntity[multipleImagesField]);
    }
  }

  protected async afterDelete(entity: any): Promise<void> {
    if (!this.imageHooks) return;
    const { singleImageField, multipleImagesField } = this.imageHooks;

    if (singleImageField && entity[singleImageField]) {
      await this.cleanupOldImage(entity[singleImageField]);
    }

    if (multipleImagesField && entity[multipleImagesField]?.length) {
      await this.cleanupOldImages(entity[multipleImagesField]);
    }
  }

  // ─────────────── Image cleanup stubs ───────────────

  protected async cleanupOldImage(imagePath: string): Promise<void> {
    this.logger.log(`🧹 Cleanup single image: ${imagePath}`);
    // Override or inject image service here
  }

  protected async cleanupOldImages(imagePaths: string[]): Promise<void> {
    for (const img of imagePaths) {
      await this.cleanupOldImage(img);
    }
  }

  // ─────────────── Helpers ───────────────

  protected get modelName() {
    return this.model?.constructor?.name || 'Entity';
  }
}
