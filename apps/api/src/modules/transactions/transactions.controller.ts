import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Giao dịch chuyển nhượng (Transactions)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Khởi tạo bản nháp giao dịch chuyển nhượng (Draft)' })
  @ApiResponse({ status: 201, description: 'Bản nháp được tạo sau khi vượt qua bước kiểm tra tuân thủ (Compliance Pre-check)' })
  createDraft(
    @Body('tokenId') tokenId: string,
    @Body('buyerId') buyerId: number,
    @Body('salePrice') salePrice: number,
    @CurrentUser() user: any,
  ) {
    // Current user is the seller
    return this.transactionsService.createDraft(tokenId, buyerId, user.sub, salePrice);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Ký xác nhận giao dịch (Dành cho cả bên mua và bên bán)' })
  @ApiResponse({ status: 201, description: 'Ký thành công. Nếu cả 2 bên cùng ký, trạng thái sẽ chuyển sang Pending_Tax' })
  sign(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.sign(id, user.sub);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy bỏ giao dịch đang trong trạng thái Draft' })
  @ApiResponse({ status: 201, description: 'Giao dịch đã được hủy' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.cancel(id, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các giao dịch của người dùng hiện tại (với tư cách Bên mua hoặc Bên bán)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách giao dịch' })
  findAll(@CurrentUser() user: any) {
    return this.transactionsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một giao dịch' })
  @ApiResponse({ status: 200, description: 'Trả về dữ liệu giao dịch' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.getOne(id);
  }
}
