@extends('layout.default')

@section('content')
<div class="px-4 pt-5 my-5 text-center ">
    <h1 class="display-4 fw-bold">Listagem de Imobiliárias</h1>
    
      <p class="lead mb-4">Clique no botão abaixo para adicionar uma nova imobiliária.</p>
      <div class="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
        <a href="{{ route('imobiliaria.create') }}" class="btn btn-primary btn-lg px-4 me-sm-3" tabindex="-1" role="button" aria-disabled="true">Adicionar</a>
      </div>
</div>

<table class="table">
    <thead>
      <tr>
        
        <th scope="col">Imobiliária</th>
        <th scope="col" style="text-align: right;">Ações</th>
      </tr>
    </thead>
    <tbody>
    @foreach ($imobiliarias as $imobiliaria)    
      <tr>
     
        <td>{{$imobiliaria->name}}</td>
        
        <td style="text-align: right;">
            <a href="#" class="btn btn-primary btn-sm" tabindex="-1" role="button" aria-disabled="true">Ver</a>
            <a href="#" class="btn btn-warning btn-sm" tabindex="-1" role="button" aria-disabled="true">Editar</a>
            <a href="#" class="btn btn-danger btn-sm" tabindex="-1" role="button" aria-disabled="true">Excluir</a>
        </td>
      </tr>
    @endforeach
    </tbody>
  </table>
@endsection