import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DemarragePage } from './demarrage';

@NgModule({
  declarations: [
    DemarragePage,
  ],
  imports: [
    IonicPageModule.forChild(DemarragePage),
  ],
  exports: [
    DemarragePage
  ]
})
export class DemarragePageModule {}
