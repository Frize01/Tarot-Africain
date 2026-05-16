<?php

use Castor\Attribute\AsTask;

use function Castor\io;
use function Castor\capture;
use function Castor\context;
use function Castor\run;


#[AsTask(description: 'Welcome to Castor!')]
function hello(): void
{
    $currentUser = capture('whoami');

    io()->title(sprintf('Hello %s!', $currentUser));
}

#[AsTask(description: 'Setup development environment // Arg : --detached --build')]
function devStart(bool $detached = false, bool $build = false): void
{
    io()->title('Starting up development environment...');
    $command = 'docker compose -f docker-compose.dev.yml up';
    if ($detached) {
        $command .= ' -d';
    }
    if ($build) {
        $command .= ' --build';
    }
    run($command, context()->withTty(true));

    if ($detached) {
        io()->success('Development environment is ready!');
    } else {
        io()->warning('Development environment has been stopped!');
    }
}

#[AsTask(description: 'Stop development environment // Arg : --volumes')]
function devStop(bool $volumes = false): void
{
    io()->title('Stopping development environment...');
    $command = 'docker compose down';
    if ($volumes) {
        $command .= ' -v';
    }
    run($command, context()->withTty(true));
    io()->success('Development environment has been stopped!');
    if ($volumes) {
        io()->warning('All volumes have been removed!');
    }
}