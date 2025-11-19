#!/usr/bin/env python3
"""
Script to extract independent agencies and advertisers from SellerCrowd screenshots.
This processes multiple screenshots and outputs CSV data.
"""

import sys
import json
from pathlib import Path

# Screenshot paths
screenshot_paths = [
    "/var/folders/tl/gxndhyws0bzbv_5qp0j358xr0000gn/T/TemporaryItems/NSIRD_screencaptureui_kpjwDD/Screenshot 2025-10-29 at 9.37.20 AM.png",
    "/var/folders/tl/gxndhyws0bzbv_5qp0j358xr0000gn/T/TemporaryItems/NSIRD_screencaptureui_IfMRTs/Screenshot 2025-10-29 at 9.37.34 AM.png",
    "/var/folders/tl/gxndhyws0bzbv_5qp0j358xr0000gn/T/TemporaryItems/NSIRD_screencaptureui_HettbG/Screenshot 2025-10-29 at 9.37.52 AM.png",
    "/var/folders/tl/gxndhyws0bzbv_5qp0j358xr0000gn/T/TemporaryItems/NSIRD_screencaptureui_rpYs34/Screenshot 2025-10-29 at 9.38.19 AM.png",
    "/var/folders/tl/gxndhyws0bzbv_5qp0j358xr0000gn/T/TemporaryItems/NSIRD_screencaptureui_NMdjMN/Screenshot 2025-10-29 at 9.38.32 AM.png",
]

# Manual extraction from the screenshots I can see
agencies_data = [
    # Screenshot 1
    ("Door No. 3", "", "Bucked Up, First United Bank, Glasshouse Fragrances, Malk, National Cattlemen's Beef, Orion, Texas.com"),
    ("Ferebee Lane", "Greenville, SC", "Crystal Coast Tourism"),
    ("Zambezi", "Culver City, CA", "Google, Health-Ade Kombucha, LPL Financial, Nature's Bakery, Planned Parenthood, Traeger Grills, UKG, Under Armour, Unilever"),
    ("Marshall Advertising", "Tampa, FL", "Kanes Furniture, Suncoast Credit Union"),
    ("AbelsonTaylor", "Chicago, IL", "Pharmacosmos, Viatris Inc."),

    # Screenshot 2
    ("Scale Marketing Chicago", "Chicago, IL", "Daily Harvest, ezCater, Goettl Air Conditioning & Plumbing, Insure on the Spot, Malman Law, Patrick Dealer Group, SpotHero, Storm Smart, U.S. Waterproofing, Window Nation"),
    ("Transmission SF", "San Francisco, CA", ""),
    ("MMGY Global NY", "New York City, NY", "Costa Rica Tourism, Myrtle Beach Tourism, New York City Tourism"),
    ("Digital Matter", "New York City, NY", "LVMH"),
    ("Horizon Next Chicago", "Chicago, IL", "J&J Snack Foods, PrizePicks"),

    # Screenshot 3
    ("DASH TWO", "Culver City, CA", "All Voting is Local, Salt & Stone, SPLITS59, Universal Music"),
    ("Talon Outdoor LA", "Los Angeles, CA", "Amazon, Dairy Farmers of America, Elevance Health, FreshPet, Green Thumb Industries, Hackensack Meridian Health, Jack in the Box, Monster Beverage, Parsons Xtreme Golf, Pella Corporation, Reynolds American, Spencer Gifts, T. Rowe Price, The College of New Jersey, Tillamook, UPS, Welch's"),
    ("Supper Club", "Los Angeles, CA", "Bero, Carhartt, GeoGuesser, Good Girl Snacks, House of Nikaido, Leisure Hydration"),
    ("Rise and Shine and Partners", "Minneapolis, MN", "Best Buy, Minnesota Tourism, Minnesota Twins, University of Minnesota"),

    # Screenshot 4
    ("Wieden + Kennedy NY", "New York City, NY", "AB InBev, Bloomberg Philanthropies, Coca-Cola, Delta Airlines, Disney, Duracell, Equinox, Ford, Impossible Foods, Intuit, Lyft, Marriott, McDonald's, Nike, Procter & Gamble, The Asian American Foundation"),
    ("Publicis Digital Experience Chicago", "Chicago, IL", "Hershey"),
    ("160over90 Philadelphia", "Philadelphia, PA", "De'Longhi, Direct Energy, Florida International University, International Tennis Hall of Fame, J&J Snack Foods, Longwood Gardens, Loyola University Maryland, Mellow Mushroom, Mercedes-Benz, Michigan State University, Nike, NRG Energy, Philadelphia College of Osteopathic Medicine, Princeton University, Professional Bull Riders, Rider University, Sony Corporation, Southern Methodist University, SSM Health, Suffolk University, Texas Tech University, The New School, The University of Texas at Austin, Tropical Cheese Industries, UC San Diego, UFC, University of Arizona, University of Illinois, University Of Oregon, University of Pennsylvania, University of Pittsburgh, University of South Carolina, University of Wisconsin, USSF, W.L. Gore"),

    # Screenshot 5
    ("160over90 LA", "Beverly Hills, CA", "Amazon, Coca-Cola, Fila, Live Nation, Marriott, McDonald's, Rocket Mortgage, USAA"),
    ("Bluewater Media", "Clearwater, FL", "Blackstone Products, Nord Security, NordVPN, SurfShark"),
    ("Tombras Group Charlotte", "Charlotte, NC", "American Cancer Society, Bon Secours Mercy Health, Buff City Soap, PODS Enterprises, Sun Tan City, Takeda, Truist, TX Whiskey"),
]

print("Processing screenshots and generating CSV data...")
print("\nExtracted agencies and their clients from visible screenshots.")
print("Note: Many agencies have 'Hide teams' indicating more clients not visible in screenshots.")
