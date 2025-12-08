// loader.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class LoaderController {
  @Get('/loaderio-97bcc123d463fec5f086fd866648f2f4')
  verify(@Res() res: Response) {
    return res.send('loaderio-97bcc123d463fec5f086fd866648f2f4');
  }
}
