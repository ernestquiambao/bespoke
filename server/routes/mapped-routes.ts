import { Router } from 'express';
import { PrismaClient, Prisma, User, BikeRoutes } from '@prisma/client';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime';
import { ThemeContext } from '@emotion/react';

// Request Handlers //
const BikeRoutes = Router();
const prisma = new PrismaClient();

// Types for typescript //
type NewBikeRoute = Prisma.BikeRoutesCreateInput & {
  origin: [number, number];
  destination: [number, number];
  user: { connect: { id: number } };
};

interface LikesQuery {
  routeId: string;
}
// End of typescript types //

// Creates new bike route with POST //
/// Only good for point A to point B ///
BikeRoutes.post('/newRoute', (req, res) => {
  const { directions, user, name, category, privacy } = req.body;
  const id = user.id;
  const originLat: number = directions.request.origin.location.lat;
  const originLng: number = directions.request.origin.location.lng;
  const destinationLat: number = directions.request.destination.location.lat;
  const destinationLng: number = directions.request.destination.location.lng;

  const newBikeRoute: NewBikeRoute = {
    origin: [originLat, originLng],
    destination: [destinationLat, destinationLng],
    user: { connect: { id: id } },
    name: name,
    category: category,
    isPrivate: privacy,
    createdAt: new Date(),
  };

  prisma.bikeRoutes
    .create({ data: newBikeRoute })
    .then((result) => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.error('Failed to handle:', err);
      res.sendStatus(500);
    });
});

BikeRoutes.get('/routes/:id', (req, res) => {
  const { id } = req.params;

  prisma.user
    .findUnique({
      where: { id: parseInt(id) },
      include: { createdRoutes: true },
    })
    .then((user) => {
      res.status(200).send(user!.createdRoutes);
    })
    .catch((err) => {
      console.error('Cannot resolve GET:', err);
      res.sendStatus(500);
    });
});

// Retrieve the reports from the server
BikeRoutes.get('/reports', async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const reportsList = await prisma.report.findMany({
      where: {
        location_lat: {
          gte: parseFloat(lat as string) - 0.01,
          lte: parseFloat(lat as string) + 0.01,
        },
        location_lng: {
          gte: parseFloat(lng as string) - 0.01,
          lte: parseFloat(lng as string) + 0.01,
        },
      },
      include: {
        comments: true,
      },
    });

    if (reportsList.length < 1) {
      res.sendStatus(404);
    } else {
      res.status(200).send(reportsList);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Handler to fetch all the public routes or the user's routes //
BikeRoutes.get('/routes', async (req, res) => {
  const { privacy, category } = req.query;
  const { id, location_lat, location_lng } = req.user as User;

  if (privacy === 'false') {
    prisma.bikeRoutes
      .findMany({
        where: {
          category: category as string,
          isPrivate: JSON.parse(privacy),
        },
        include: {
          userLikes: true,
        },
      })
      .then((routeList) => {
        const radiusRoutes: BikeRoutes[] = [];
        const likeList: any[] = [];
        routeList.forEach((route) => {
          const gteLat = location_lat! - 0.4;
          const lteLat = location_lat! + 0.4;
          const gteLng = location_lng! - 0.4;
          const lteLng = location_lng! + 0.4;

          if (
            (route.origin[0] as unknown as number) >= gteLat &&
            (route.origin[0] as unknown as number) <= lteLat &&
            (route.origin[1] as unknown as number) >= gteLng &&
            (route.origin[1] as unknown as number) <= lteLng
          ) {
            radiusRoutes.push(route);
            likeList.push(route.userLikes);
          }
        });
        res.status(200).send([radiusRoutes, likeList]);
      })
      .catch((err) => {
        console.error('Failed to fetch: ', err);
      });
  } else if (privacy === 'true') {
    prisma.user
      .findUnique({
        where: {
          id: id,
        },
        include: {
          createdRoutes: {
            include: {
              userLikes: true,
            },
          },
        },
      })
      .then((user) => {
        console.log(user);
        const radiusRoutes: BikeRoutes[] = [];
        const likeList: any[] = [];
        user!.createdRoutes.forEach((route) => {
          const gteLat = location_lat! - 0.4;
          const lteLat = location_lat! + 0.4;
          const gteLng = location_lng! - 0.4;
          const lteLng = location_lng! + 0.4;

          if (
            (route.origin[0] as unknown as number) >= gteLat &&
            (route.origin[0] as unknown as number) <= lteLat &&
            (route.origin[1] as unknown as number) >= gteLng &&
            (route.origin[1] as unknown as number) <= lteLng
          ) {
            radiusRoutes.push(route);
            likeList.push(route.userLikes);
          }
        });
        res.status(200).send([radiusRoutes, likeList]);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }
});

// Update a user and create or delete a user's like of a bike route //
BikeRoutes.put('/likes', async (req, res) => {
  const { like, routeId, userId } = req.body;
  const { id } = req.user as User;
  const user = await prisma.user.findUnique({ where: { id: id } });
  const route = await prisma.bikeRoutes.findUnique({ where: { id: routeId } });
  const totalLikesReceived = user?.totalLikesReceived;
  const routeLikes = route?.likes;

  // This conditional modifies what will happen when the value of the like button is true or false //
  if (!like) {
    // When false delete the like relation //
    prisma.routeLike
      .deleteMany({
        where: {
          userId: id,
          bikeRouteId: routeId,
        },
      })
      .then((message) => {
        // Then update the user that created the route's like counter //
        console.log(message);
        prisma.user
          .update({
            where: {
              id: userId,
            },
            data: {
              totalLikesReceived: totalLikesReceived! - 1,
            },
          })
          .then(() => {
            // Then update the route's like counter //
            prisma.bikeRoutes
              .update({
                where: {
                  id: routeId,
                },
                data: {
                  likes: routeLikes! - 1,
                },
              })
              .then((route) => {
                // Send the route back to the client to change the number on the screen //
                res.status(200).send(route);
              })
              .catch((err) => {
                console.error('Failed to update routes:', err);
                res.sendStatus(500);
              });
          })
          .catch((err) => {
            console.error('Failed to update user:', err);
            res.sendStatus(500);
          });
      })
      .catch((err) => {
        console.error('Failed to delete like relation:', err);
        res.sendStatus(500);
      });
  } else {
    prisma.routeLike
      .create({
        data: {
          user: { connect: { id: id } },
          bikeRoutes: { connect: { id: routeId } },
        },
      })
      .then(() => {
        prisma.user
          .update({
            where: {
              id: userId,
            },
            data: {
              totalLikesReceived: totalLikesReceived! + 1,
            },
          })
          .then(() => {
            prisma.bikeRoutes
              .update({
                where: {
                  id: routeId,
                },
                data: {
                  likes: routeLikes! + 1,
                },
              })
              .then((route) => {
                res.status(200).send(route);
              })
              .catch((err) => {
                console.error('Failed to update routes:', err);
                res.sendStatus(500);
              });
          })
          .catch((err) => {
            console.error('Failed to update user:', err);
            res.sendStatus(500);
          });
      })
      .catch((err) => {
        console.error('Failed to create relation:', err);
        res.sendStatus(500);
      });
  }
});

BikeRoutes.get('/likesValue', (req, res) => {
  const { routeId } = req.query as unknown as LikesQuery;
  const { id } = req.user as User;

  prisma.routeLike
    .findMany({
      where: {
        userId: id,
        bikeRouteId: parseInt(routeId),
      },
    })
    .then((like) => {
      if (!like) {
        res.sendStatus(404);
      } else {
        res.status(201).send(like);
      }
    })
    .catch((err) => {
      console.error('Failed to finish request:', err);
    });
});

export default BikeRoutes;
