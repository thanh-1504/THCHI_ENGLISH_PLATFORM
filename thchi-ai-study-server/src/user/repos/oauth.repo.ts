import { Injectable } from '@nestjs/common';
import { AuthProvider } from 'generated/prisma/enums';
import { GoogleUser } from 'src/shared/interfaces/IUser';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateOauthDTO } from '../dto/oauth.user.dto';

@Injectable()
export class OauthRepo {
  constructor(private readonly prismaService: PrismaService) {}

  findByProviderAndProviderId(provider: AuthProvider, providerUid: string) {
    return this.prismaService.oAuthAccount.findUnique({
      where: {
        provider_providerUid: {
          provider,
          providerUid,
        },
      },
    });
  }

  create(payload: CreateOauthDTO) {
    return this.prismaService.oAuthAccount.create({ data: payload });
  }

  
}
