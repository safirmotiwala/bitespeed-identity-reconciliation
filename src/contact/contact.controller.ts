import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { IdentifyRequestDto, IdentifyResponseDto } from './contact.dto';
// This service will handle the database logic
import { ContactService } from './contact.service';

@Controller()
@ApiTags('identify')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('/identify')
  @ApiBody({ type: IdentifyRequestDto })
  @ApiResponse({ status: 200, type: IdentifyResponseDto })
  async identify(
    @Body() identifyRequestDto: IdentifyRequestDto,
  ): Promise<IdentifyResponseDto> {
    if (!identifyRequestDto.email && !identifyRequestDto.phoneNumber) {
      throw new HttpException(
        'Either email or phoneNumber is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const contactDto = await this.contactService.reconcile(
        identifyRequestDto,
      );
      return { contact: contactDto };
    } catch (error) {
      console.log(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
