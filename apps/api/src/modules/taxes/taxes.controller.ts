import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TaxesService } from './taxes.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Taxes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post('calculate/transfer/:transactionId')
  @ApiOperation({ summary: 'Calculate transfer taxes for a transaction' })
  calculateTransferTaxes(@Param('transactionId', ParseIntPipe) transactionId: number) {
    return this.taxesService.calculateAndSaveTransferTaxes(transactionId);
  }

  @Post('pay/:taxId')
  @ApiOperation({ summary: 'Pay a specific tax fee' })
  payTax(
    @Param('taxId', ParseIntPipe) taxId: number,
    @CurrentUser() user: any,
  ) {
    return this.taxesService.payTax(taxId, user.sub);
  }

  @Post('calculate/annual')
  @ApiOperation({ summary: 'Preview annual land tax calculation' })
  previewAnnualTax(
    @Body('area') area: number,
    @Body('pricePerM2') pricePerM2: number,
    @Body('limit') limit: number,
  ) {
    const amount = this.taxesService.calculateAnnualLandTax(area, pricePerM2, limit);
    return { area, pricePerM2, limit, calculatedTax: amount };
  }
}
