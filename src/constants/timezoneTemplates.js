const timezoneTemplates = {
  latamSpain: {
    title: 'LATAM + Spain (Midutime)',
    timezones: [
      'Europe/Madrid',
      'America/Montevideo',
      'America/Argentina/Buenos_Aires',
      'America/Santiago',
      'America/Asuncion',
      'America/Port_of_Spain',
      'America/La_Paz',
      'America/Caracas',
      'America/Santo_Domingo',
      'America/Bogota',
      'America/Lima',
      'America/Guayaquil',
      'America/Havana',
      'America/Panama',
      'America/Mexico_City',
      'America/Costa_Rica',
      'America/Managua',
      'America/El_Salvador',
      'America/Tegucigalpa',
      'America/Guatemala',
    ],
  },
  usa: {
    title: 'United States',
    timezones: [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'America/Adak',
      'Pacific/Honolulu',
      'America/Phoenix',
    ],
  },
  europe: {
    title: 'Europe',
    timezones: [
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'Europe/Amsterdam',
      'Europe/Brussels',
      'Europe/Zurich',
      'Europe/Athens',
      'Europe/Istanbul',
      'Europe/Moscow',
    ],
  },
  // Add more templates as needed
};

timezoneTemplates.brazil = {
  title: 'LATAM + Spain + Brazil',
  timezones: [
    ...timezoneTemplates.latamSpain.timezones,
    'America/Sao_Paulo', // Sao Paulo (Brasilia Time)
    'America/Rio_Branco', // Rio Blanco (Acre time)
    'America/Manaus', // Manaus (Amazon time)
    'America/Noronha', // Noronha (Fernando de Noronha Time)
  ],
};

export default timezoneTemplates;