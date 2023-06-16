@extends('layout.default')

@section('content')

<div class="px-4 pt-5 my-5 text-center ">
      <p class="lead mb-4" style="font-weight: bold">Preencha os campos abaixo para adicionar uma nova imobiliária.</p>
</div>



<div class="row">
    <div class="col">
    </div>
    <div class="col-6">
        <form 
            enctype="multipart/form-data"
            method="POST"
            action="{{ route('imobiliaria.store') }}"
            >
            @csrf
            <div class="mb-3">
              <label style="font-weight: bold;" for="exampleInputEmail1" class="form-label">Nome da Imobiliária</label>
              <input 
                type="text" 
                name="name"
                value="{{ old('name') }}"
                class="form-control"
                id="exampleInputEmail1" 
                aria-describedby="emailHelp"
                >
                @error('name')
                    <span style="color: #f00;">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label style="font-weight: bold;" for="exampleInputEmail1" class="form-label">ID da Planilha Google</label>
                <input 
                type="text" 
                name="tabela_id"
                value="{{ old('tabela_id') }}"
                class="form-control"
                id="tabela_id" 
                aria-describedby="emailHelp"
                >
                @error('tabela_id')
                    <span style="color: #f00;">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label style="font-weight: bold;" for="exampleInputEmail1" class="form-label">Nome da Planilha Google</label>
                <input 
                type="nome_planilha"
                name="nome_planilha" 
                value="{{ old('nome_planilha') }}"
                class="form-control"
                id="exampleInputEmail1" 
                aria-describedby="emailHelp"
                >
                @error('nome_planilha')
                    <span style="color: #f00;">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label style="font-weight: bold;" for="exampleInputEmail1" class="form-label">Arquivo Json Google</label>
                <input 
                type="file" 
                name="arquivo_json"
                class="form-control"
                id="arquivo_json" 
                aria-describedby="emailHelp"
                >
                @error('arquivo_json')
                    <span style="color: #f00;">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label style="font-weight: bold;" for="exampleInputEmail1" class="form-label">Arquivo de Áudio do Whatsapp</label>
                <input 
                type="file" 
                name="audio_whatsapp"
                class="form-control"
                id="audio_whatsapp" 
                aria-describedby="emailHelp"
                >
                @error('audio_whatsapp')
                    <span style="color: #f00;">{{ $message }}</span>
                @enderror
            </div>
            
           
            <button type="submit" class="btn btn-primary">Cadastrar</button>
            <a href="{{ route('imobiliaria') }}" class="btn btn-secondary" tabindex="-1" role="button" aria-disabled="true">Voltar</a>
            
          </form>
    </div>
    <div class="col">
    </div>
  </div>



@endsection