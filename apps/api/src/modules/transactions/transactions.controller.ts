import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a draft transaction' })
  createDraft(
    @Body('tokenId') tokenId: string,
    @Body('sellerId') sellerId: number,
    @Body('salePrice') salePrice: number,
    @CurrentUser() user: any,
  ) {
    // Current user is the buyer
    return this.transactionsService.createDraft(tokenId, user.sub, sellerId, salePrice);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign a transaction' })
  sign(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.sign(id, user.sub);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a transaction' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.cancel(id, user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.getOne(id);
  }
}
