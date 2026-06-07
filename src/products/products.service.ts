import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const total = await this.prisma.product.count({
      where: { available: true },
    });
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;

    return {
      data: await this.prisma.product.findMany({
        where: { available: true },
        skip,
        take: limit,
      }),
      meta: {
        totalPages,
        currentPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, available: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...rest } = updateProductDto;
    return this.prisma.product.update({
      where: { id },
      data: rest,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
    return product;
  }
}
