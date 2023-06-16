<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldToImobiliariasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('imobiliarias', function (Blueprint $table) {
            $table->string('audio_whatsapp')->nullable()->after('nome_planilha');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('imobiliarias', function (Blueprint $table) {
            $table->dropColumn('audio_whatsapp');
        });
    }
}
