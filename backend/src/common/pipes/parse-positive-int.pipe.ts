import { BadRequestException, Injectable, ParseIntPipe } from '@nestjs/common'

@Injectable()
export class ParsePositiveIntPipe extends ParseIntPipe {
  async transform(value: string, metadata: Parameters<ParseIntPipe['transform']>[1]) {
    const parsed = await super.transform(value, metadata)
    if (parsed < 1) throw new BadRequestException('O identificador deve ser um inteiro positivo')
    return parsed
  }
}
