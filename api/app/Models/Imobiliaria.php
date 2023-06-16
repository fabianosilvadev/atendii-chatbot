<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Imobiliaria extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'user_id',
        'tabela_id',
        'nome_planilha',
        'arquivo_json',
        'audio_whatsapp',
        'token',
        
    ];
}
