import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-image-modal',
  templateUrl: 'image-modal.html'
})
export class ImageModalPage {
  // ImageModalPage
 // C'est la page qui s'affiche lorsque l'utilisateur tape sur une image sur la vue du produit.
   // product.html.
  private image;
  constructor(public navCtrl: NavController, public navParams: NavParams) { }

  ionViewDidLoad() {
    this.image = this.navParams.get('img');
  }

  close() {
    this.navCtrl.pop();
  }

}
