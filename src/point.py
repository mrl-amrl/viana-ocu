from geopy import distance

class Point:
    def __init__(self, lat, lng):
        self.lat = lat
        self.lng = lng

    def get_point(self):
        return self.lat, self.lng

    def distance(self, other):
        return distance.vincenty(self.get_point(), other.get_point()).m

    def __str__(self):
        return "lat: {:12.8f} lng: {:12.8f}".format(self.lat, self.lng)
