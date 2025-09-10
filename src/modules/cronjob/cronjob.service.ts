// import { Injectable, Inject } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
// import Redis from 'ioredis';
// import { DateTime } from 'luxon';


// @Injectable()
// export class CronjobService {
//   private readonly keysToIgnore = ['mykey', 'plansUniverse', 'user_2030304'];

//   constructor(@Inject('REDIS') private readonly redis: Redis) {}

//   @Cron('* * * * *') // Cada 1 minuto
//   async handleCron() {
//     console.log('job ejecutado cada 1 min')
//     const allKeys = await this.redis.keys('*'); // Obtener todas las claves de Redis

//     // Filtrar las claves que deben ser ignoradas
//     const filteredKeys = allKeys.filter(key => !this.keysToIgnore.includes(key));

//     for (const key of filteredKeys) {
//       const jsonData = await this.redis.get(key);
//       if (!jsonData) continue;

//       const data = JSON.parse(jsonData);

//       if (data && data.histories) {
//         const currentDate = DateTime.now().setZone('America/Santiago');
//         console.log('hora actual',currentDate)

//         // Filtrar las historias expiradas
//         data.histories = data.histories.filter((history) => {
//           const expirationDate = DateTime.fromISO(history.dateExpired);
//           return expirationDate > currentDate; // Mantener solo las historias no expiradas
//         });

//         // Guardar los datos actualizados en Redis
//         await this.redis.set(key, JSON.stringify(data));
//       }
//     }
//   }
// }
