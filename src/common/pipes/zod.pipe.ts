import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';

export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);
  constructor(private schema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error) {
        const parsedError = JSON.parse(error?.message);
        const errors = parsedError?.map((err: any) => ({
          field: err?.path?.join('.'),
          message: err?.message,
        }));

        this.logger.error(`Validation failed: ${JSON.stringify(errors)}`);

        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: errors,
        });
      }

      throw new BadRequestException('Validation failed');
    }
  }
}
