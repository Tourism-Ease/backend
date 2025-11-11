import { Injectable } from '@nestjs/common';
import { BaseFactory } from '@/common/base/base.factory';
import { PrismaService } from '@/prisma/prisma.service';
import { Hotel } from '@prisma/client';

@Injectable()
export class HotelsService extends BaseFactory<Hotel> {
  protected model; // just declare it

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.model = this.prisma.hotel; // initialize here
  }

  protected beforeCreate(data: any) {
    if (data.stars < 1 || data.stars > 5) data.stars = 3;
    return data;
  }
}
