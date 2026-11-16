<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('itineraries:check-reminders', function () {
    $controller = app(\App\Http\Controllers\ItineraryController::class);
    $req = new \Illuminate\Http\Request();
    $response = $controller->checkReminders($req);
    $this->info($response->getData()->message);
})->purpose('Check upcoming itineraries and send H-1 and Hari-H reminders');
