import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetPasswordRequestDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;
}
