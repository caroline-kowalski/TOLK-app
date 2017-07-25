webpackJsonp([2],{

/***/ 476:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(7);
throw new Error("Cannot find module \"./app.component\"");
throw new Error("Cannot find module \"../pages/notes/notes\"");
throw new Error("Cannot find module \"../pages/add-item/add-item\"");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["a" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_3__app_component__["MyApp"],
            __WEBPACK_IMPORTED_MODULE_4__pages_notes_notes__["NotesPage"],
            __WEBPACK_IMPORTED_MODULE_5__pages_add_item_add_item__["AddItemPage"]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["a" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_3__app_component__["MyApp"])
        ],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* IonicApp */]],
        entryComponents: [
            __WEBPACK_IMPORTED_MODULE_3__app_component__["MyApp"],
            __WEBPACK_IMPORTED_MODULE_4__pages_notes_notes__["NotesPage"],
            __WEBPACK_IMPORTED_MODULE_5__pages_add_item_add_item__["AddItemPage"]
        ],
        providers: [{ provide: __WEBPACK_IMPORTED_MODULE_1__angular_core__["b" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["c" /* IonicErrorHandler */] }]
    })
], AppModule);

//# sourceMappingURL=add-item.module.js.map

/***/ })

});
//# sourceMappingURL=2.main.js.map