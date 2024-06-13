import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [PrismaModule, ContactModule],
})
export class AppModule {}
