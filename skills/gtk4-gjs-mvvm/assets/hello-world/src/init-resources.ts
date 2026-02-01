import Gio from 'gi://Gio';

// Initialize GResource
const resource = Gio.Resource.load('resources/helloworld.gresource');
Gio.resources_register(resource);
