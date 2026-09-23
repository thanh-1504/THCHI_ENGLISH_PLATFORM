import { Injectable } from '@nestjs/common';
import { TransactionStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateTransactionType } from '../schemas/transaction.schema';

@Injectable()
export class TransactionRepo {
  constructor(private readonly prisma: PrismaService) {}

  checkIsSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: {
        userId,
      },
    });
  }

  checkTransactionPending(userId: string) {
    return this.prisma.transaction.findFirst({
      where: {
        userId,
        status: TransactionStatus.PENDING,
      },
    });
  }

  findOne(payload: { id: string } | { paymentCode: string }) {
    return this.prisma.transaction.findUnique({
      where: payload,
    });
  }

  findOneDetail(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            name: true,
            duration: true,
            price: true,
            originalPrice: true,
            badge: true,
            description: true,
            isActive: true,
          },
        },
      },
    });
  }

  getTransactionsHistory(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        plan: {
          select: {
            name: true,
            duration: true,
            price: true,
            originalPrice: true,
            badge: true,
            description: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(userId: string, payload: CreateTransactionType) {
    const paymentCode = `SEVQR${Date.now().toString().substring(5)}`; 
    return this.prisma.transaction.create({
      data: {
        userId,
        planId: payload.planId,
        amount: payload.amount,
        paymentGateway: payload.paymentGateway,
        paymentCode,
      },
    });
  }

  updateStatus(id: string, status: TransactionStatus) {
    return this.prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  update(payload: {
    userId: string;
    id: string;
    status: TransactionStatus;
    endDate: Date;
    startDate: Date;
  }) {
    const { userId, id, status, endDate, startDate } = payload;
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.update({
        where: { id },
        data: { status },
      });
      await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planId: transaction.planId,
          startDate,
          endDate,
          isActive: true,
        },
        update: {
          planId: transaction?.planId,
          startDate,
          endDate,
          isActive: true,
        },
      });
      return transaction;
    });
  }
}
