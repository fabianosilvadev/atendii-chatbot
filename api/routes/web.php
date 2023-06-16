<?php

use App\Http\Controllers\ImobiliariaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/*Route::get('/', function () {
    return view('welcome');
});*/

Route::get('/', [ImobiliariaController::class, 'index'])->name('imobiliaria');
Route::get('/imobiliaria/create', [ImobiliariaController::class, 'create'])->name('imobiliaria.create');
Route::post('/imobiliaria/store', [ImobiliariaController::class, 'store'])->name('imobiliaria.store');
Route::get('/imobiliaria/{id}', [ImobiliariaController::class, 'show'])->name('imobiliaria.show');
