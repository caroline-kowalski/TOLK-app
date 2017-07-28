import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, ViewController, App} from 'ionic-angular';
import { AddItemPage } from '../add-item/add-item'
import { ItemDetailPage } from '../item-detail/item-detail';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
 import { FirebaseProvider } from './../../providers/firebase';
/**
 * Generated class for the NotesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-notes',
  templateUrl: 'notes.html',
})
export class NotesPage {

  notes: FirebaseListObservable<any[]>;
  title = '';
  date;
  constructor( public app: App, public firebaseProvider: FirebaseProvider, public afd: AngularFireDatabase, public navCtrl: NavController, public view: ViewController) {
   this.notes = this.firebaseProvider.getNotes();
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AddItemPage');
  }


 getNotes() {
    return this.afd.object('/notes/');
  }
  saveItem(){
 

   this.firebaseProvider.addItem(this.title);
   this.firebaseProvider.addItem(this.date);

    let newItem = {
      title: this.title,
      date: this.date
    };
 
    this.view.dismiss(newItem);

    this.app.getRootNav().push(NotesPage);
 
  }


  removeItem(id) {
    this.firebaseProvider.removeItem(id);
  }

  addItem()
  {
  }
  //

  viewItem(item){
    this.navCtrl.push(ItemDetailPage, {
    item: item
  });
}

}
