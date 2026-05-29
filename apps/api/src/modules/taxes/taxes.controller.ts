import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TaxesService } from './taxes.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Nghĩa vụ tài chính (Taxes)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post('calculate/transfer/:transactionId')
  @ApiOperation({ summary: 'Tính toán các loại thuế chuyển nhượng (TNCN, Trước bạ, Công chứng)' })
  @ApiResponse({ status: 201, description: 'Tính toán thành công và lưu trữ nghĩa vụ thuế' })
  calculateTransferTaxes(@Param('transactionId', ParseIntPipe) transactionId: number) {
    return this.taxesService.calculateAndSaveTransferTaxes(transactionId);
  }

  @Post('pay/:taxId')
  @ApiOperation({ summary: 'Thanh toán thuế/phí và nhận biên lai' })
  @ApiResponse({ status: 201, description: 'Thanh toán thành công, trạng thái thuế đổi thành Paid' })
  payTax(
    @Param('taxId', ParseIntPipe) taxId: number,
    @CurrentUser() user: any,
  ) {
    return this.taxesService.payTax(taxId, user.sub);
  }

  @Post('calculate/annual')
  @ApiOperation({ summary: 'Xem trước cách tính thuế sử dụng đất phi nông nghiệp hàng năm' })
  @ApiResponse({ status: 201, description: 'Trả về giá trị thuế dự kiến dựa trên diện tích và hạn mức' })
  previewAnnualTax(
    @Body('area') area: number,
    @Body('pricePerM2') pricePerM2: number,
    @Body('limit') limit: number,
  ) {
    const amount = this.taxesService.calculateAnnualLandTax(area, pricePerM2, limit);
    return { area, pricePerM2, limit, calculatedTax: amount };
  }

  @Get('transaction/:id')
  @ApiOperation({ summary: 'Lấy danh sách các khoản thuế phí của một giao dịch' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách thuế' })
  getTaxesByTransaction(@Param('id', ParseIntPipe) id: number) {
    return this.taxesService.getTaxesByTransaction(id);
  }

  @Get('receipts/my')
  @ApiOperation({ summary: 'Lấy danh sách biên lai của công dân' })
  getMyReceipts(@CurrentUser() user: any) {
    return this.taxesService.getMyReceipts(user.sub);
  }

  @Get('receipts/:id/verify')
  @ApiOperation({ summary: 'Xác minh biên lai trên IPFS và Blockchain' })
  verifyReceipt(@Param('id', ParseIntPipe) id: number) {
    return this.taxesService.verifyReceipt(id);
  }
}
