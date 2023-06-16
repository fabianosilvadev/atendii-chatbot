<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Imobiliaria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;


class ImobiliariaController extends Controller
{
    public function index()
    {
        $imobiliarias = Imobiliaria::all();
        return view('imobiliarias', [
            'imobiliarias' => $imobiliarias
        ]);
    }

    public function show($id)
    {
        $imobiliarias = Imobiliaria::find($id);
        return $imobiliarias;
    }

    public function create()
    {
        $caminho = base_path();
        $count_caminho = Str::length($caminho);
        $count_caminho = $count_caminho - 3;
        $count_caminho = Str::substr($caminho, 0 , $count_caminho);
        $count_caminho = $count_caminho . 'app/';

        //echo shell_exec('cd ' . $count_caminho . "imobiliaria/ node index.js");
        $count_caminho = 'node ' . $count_caminho . 'imobiliaria/index.js';
        
        exec($count_caminho);




        return view('imobiliaria_criar');
    }

    public function store(Request $request)
    {
        $input = $request->validate([
            'name' => 'required|string',
            'tabela_id' => 'required|string',
            'nome_planilha' => 'required|string',
            'arquivo_json' => 'file',
            'audio_whatsapp' => 'file',
        ]);
        $input['user_id'] = 2;
        $input['token'] = md5($input['user_id']);

        $store = Imobiliaria::create($input);
        $imobiliaria_id = $store->id;


        $caminho = base_path();
        $count_caminho = Str::length($caminho);
        $count_caminho = $count_caminho - 3;
        $count_caminho = Str::substr($caminho, 0 , $count_caminho);
        $imobiliaria_slug = $imobiliaria_id . '-' . Str::slug($input['name'], '-');
        $count_caminho = $count_caminho . 'app/'. $imobiliaria_slug;
       // return $count_caminho;
        $response = mkdir($count_caminho);
        

        /*if(!File::isDirectory($path)){
            File::makeDirectory($path, 0777, true, true);
        }*/
        
        
        //salva o $input['arquivo_json'] na pasta raiz app
        $path = $request->file('arquivo_json')->storeAs(
            'app/'. $imobiliaria_slug .'/',
            'arquivo_json',
            'local_raiz'
        );

         //salva o $input['audio_whatsapp'] na pasta raiz app
         $path = $request->file('audio_whatsapp')->storeAs(
            'app/'. $imobiliaria_slug .'/',
            'audio_whatsapp.ogg',
            'local_raiz'
        );
        
        //dd($response);
        //dd($input);

        

        Imobiliaria::create($input);
        return Redirect::route('imobiliaria');
    
    }
}
