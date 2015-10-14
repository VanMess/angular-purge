var libraryName = 'vgPurge';
// Modules
ng.module(libraryName, [])
    .run([
        'purge.parsers',
        function(parsers) {
            PurgeClass.setChannels(parsers.get());
        }
    ]);
