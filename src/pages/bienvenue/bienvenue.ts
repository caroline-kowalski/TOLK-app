import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';

import { MessagesPage } from '../messages/messages';
import { HomePage } from '../home/home';
import { NotesPage } from '../notes/notes';

import { DemarragePage } from '../demarrage/demarrage';
/**
 * Generated class for the BienvenuePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-bienvenue',
  templateUrl: 'bienvenue.html',
})
export class BienvenuePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public app: App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BienvenuePage');

   this.app.getRootNav().push(DemarragePage);
  }

  PageChat(){

   this.app.getRootNav().push(MessagesPage);
  }

  HomePage(){

   this.app.getRootNav().push(HomePage);
  }

   NotesPage(){

   this.app.getRootNav().push(NotesPage);
  }

}
