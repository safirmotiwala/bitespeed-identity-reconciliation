import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdentifyRequestDto {
  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  @ApiProperty({ required: false })
  // If email is provided, it will be used to identify the contact
  email?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  // If phoneNumber is provided, it will be used to identify the contact
  phoneNumber?: string;
}

export class ContactDto {
  primaryContactId: number;
  // first element being the email of the primary contact
  emails: string[];
  // first element being the phoneNumber of the primary contact
  phoneNumbers: string[];
  // Array of all Contact IDs that are "secondary" to the primary contact
  secondaryContactIds: number[];
}

export class IdentifyResponseDto {
  // The contact that was identified
  contact: ContactDto;
}
