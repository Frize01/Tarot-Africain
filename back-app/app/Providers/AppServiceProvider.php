<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Contracts\GameServiceContract;
use App\Services\{DeckService, GameService, TarotBot};

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(GameServiceContract::class, function () {
            return new GameService(new DeckService(), new TarotBot());
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
