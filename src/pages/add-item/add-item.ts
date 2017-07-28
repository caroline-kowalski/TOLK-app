import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController} from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
 import { FirebaseProvider } from './../../providers/firebase';

/**
 * Generated class for the AddItemPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-add-item',
  templateUrl: 'add-item.html',
})
export class AddItemPage {

  notes: FirebaseListObservable<any[]>;
  title = '';
  date;
  constructor(public firebaseProvider: FirebaseProvider, public afd: AngularFireDatabase, public navCtrl: NavController, public view: ViewController) {
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
 
  }
  
  removeItem(id) {
    this.firebaseProvider.removeItem(id);
  }

 
  close(){
    this.view.dismiss();
  }

}