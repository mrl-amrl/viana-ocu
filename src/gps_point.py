import rospy
import math
from geographiclib.geodesic import Geodesic

def calc_goal(origin_lat, origin_long, goal_lat, goal_long):
  # Calculate distance and azimuth between GPS points
  geod = Geodesic.WGS84  # define the WGS84 ellipsoid
  g = geod.Inverse(origin_lat, origin_long, goal_lat, goal_long) # Compute several geodesic calculations between two GPS points 
  hypotenuse = distance = g['s12'] # access distance
  azimuth = g['azi1']
  azimuth = math.radians(azimuth)
  x = math.cos(azimuth) * hypotenuse
  y = math.sin(azimuth) * hypotenuse

  return x, y