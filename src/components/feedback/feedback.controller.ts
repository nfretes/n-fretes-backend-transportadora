import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createFeedback(
    @GetUserId() userId: string,
    @Body() body: { description: string; imageBase64?: string },
  ) {
    const feedback = await this.feedbackService.createFeedback({
      userId,
      description: body.description,
      imageBase64: body.imageBase64,
    });
    return { message: 'Feedback enviado com sucesso', feedback };
  }
}
