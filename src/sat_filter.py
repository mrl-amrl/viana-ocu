from point import Point


class SatFilter:
    def __init__(self, limit):
        self.points = []
        self.samples_limit = limit
    
    def add_sample(self, lat, lng):
        point = Point(lat, lng)
        self.points.append(point)
        if len(self.points) > self.samples_limit:
            self.points = self.points[1:]
    
    def smooth(self):
        point = self._calculate_mean(self.points)
        radius = self._calculate_radius(point)

        return point, radius

    def _calculate_mean(self, points):
        lats = []
        lngs = []
        for point in points:
            lats.append(point.lat)
            lngs.append(point.lng)

        point = Point(
            sum(lats) / len(points),
            sum(lngs) / len(points),
        )
        return point  

    def _calculate_radius(self, mean=None):
        if mean is None:
            mean = self._calculate_mean(self.points)

        radiuses = []
        for point in self.points:
            radiuses.append(point.distance(mean))
        return max(radiuses)
