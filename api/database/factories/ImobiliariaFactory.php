<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ImobiliariaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->company,
            'user_id' => rand(1,\App\Models\User::all()->count()),
            'arquivo_json' => $this->faker->name,
            'tabela_id' => $this->faker->asciify('user-****'),
            'nome_planilha' => $this->faker->name,
            'token' => $this->faker->asciify('user-****'),



        ];
    }
}
