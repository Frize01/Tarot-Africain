<?php

namespace App\Enums;

enum RoomStatus: string
{
    case Waiting  = 'waiting';
    case Ready    = 'ready';
    case Starting = 'starting';
    case Finished = 'finished';
}
