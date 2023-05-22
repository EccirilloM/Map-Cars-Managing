import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from 'src/app/service/marker.service';
import { AuthService } from 'src/app/service/autentificazione.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NominatimService } from 'src/app/service/nominatim.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements AfterViewInit {
  private map: any;
  private markerPointIds = new Map<L.Marker, number>();
  public searchResults: any[] = [];
  public searchTerm: string = '';
  currentMarkers: L.Marker[] = [];
  public lat: string = '';
  public lon: string = '';
  

  private initMap(): void {
    this.map = L.map('map', {
      center: [41.91, 12.48],
      zoom: 6,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);
    this.map.on('click', (e: any) => this.createPoint(e));
  }

  private username: string | null = null;

  constructor(private markerService: MarkerService, private authService: AuthService, private router: Router, private http: HttpClient, private nominatimService: NominatimService) {}

  private createAndConfigureMarker(latlng: L.LatLngExpression, username: string, id?: number): L.Marker {
    const marker = L.marker(latlng).addTo(this.map);
    
    // Se abbiamo un id, lo aggiungiamo all'oggetto Map
    if (id !== undefined) {
      this.markerPointIds.set(marker, id);
    }
    
    // Controlla se latlng è un oggetto o un array e crea il contenuto del popup di conseguenza
    let lat, lng;
    if (Array.isArray(latlng)) {
      [lat, lng] = latlng;
    } else {
      lat = latlng.lat;
      lng = latlng.lng;
    }
    
    const popupContent = `
      Creato da: <a id="link-${username}" style="cursor: pointer;">${username}</a>
      <br>LAT: ${lat}
      <br>LON: ${lng}`;
    marker.bindPopup(popupContent);

    
    // Aggiungiamo gli event listener per il mouseover, mouseout e click
    marker.on('mouseover', () => this.handleMouseOver(marker, username));
    marker.on('mouseout', this.handleMouseOut);
    marker.on('click', () => this.handleClick(marker));
    
    return marker;
  }
  
  private createPoint(e: any): void {
    const point = {
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
      userId: this.authService.getUserId(),
    };
  
    this.markerService.addPoint(point.latitude, point.longitude, point.userId).subscribe({
      next: (response: any) => {
        const username = this.authService.getUsername();
        this.createAndConfigureMarker(e.latlng, username, response.id);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  private createPointFromButton(lat: number, lon: number): void {
    const point = {
      latitude: lat,
      longitude: lon,
      userId: this.authService.getUserId(),
    };

    this.markerService.addPoint(point.latitude, point.longitude, point.userId).subscribe({
      next: (response: any) => {
        const username = this.authService.getUsername();
        this.createAndConfigureMarker([lat, lon], username, response.id);
        console.log("Successfully point added to DB"); // Messaggio di successo
      },
      error: (error) => {
        console.log("Error, point not added to DB"); // Messaggio di errore
      }
    });
  }

  private deletePoint(marker: L.Marker): void {
    this.map.removeLayer(marker);

    const pointId = this.markerPointIds.get(marker);
    if (pointId !== undefined) {
      // Se abbiamo un pointId, lo rimuoviamo dal backend
      this.markerService.removePoint(pointId).subscribe(response => {
        console.log(response);
      }, error => {
        console.log(error);
      });

      // Rimuovi la voce dall'oggetto Map
      this.markerPointIds.delete(marker);
    } else {
      console.error('Could not find point ID for marker');
    }
  }

  private handleMouseOver(marker: L.Marker, username: string): void {
    marker.openPopup();

    this.username = username;
    const link = document.getElementById(`link-${username}`);
    if (link) {
      link.addEventListener('click', (e) => this.navigateToUser(e, username));
    }
  }
  
  private handleMouseOut(): void {
    const link = document.getElementById(`link-${this.username}`);
    if (link) {
      link.removeEventListener('click', (e) => this.navigateToUser(e, this.username));
    }
  }

  private handleClick(marker: L.Marker): void {
    this.deletePoint(marker);
  }

  private handleAddPointButtonClick(): void {
    const button = document.getElementById('add-point-button');
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Qui devi implementare l'aggiunta del punto al tuo database
        // Utilizza l'ultimo marker nell'array currentMarkers come punto da aggiungere
        const marker = this.currentMarkers[this.currentMarkers.length - 1];
        if (marker) {
          const lat = marker.getLatLng().lat;
          const lon = marker.getLatLng().lng;
          console.log(`Adding point at ${lat}, ${lon} to database`);
          // Qui chiami il tuo metodo createPointFromButton
          this.createPointFromButton(lat, lon);
        }
      });
    }
  }
  
  private navigateToUser(e: MouseEvent, username: string | null): void {
    e.preventDefault();
    if (username) {
      this.router.navigate(['/getAllPersons'], { queryParams: { searchTerm: username } });
    }
  }

  searchNominatim(query: string) {
    // Utilizza il metodo search del servizio Nominatim
    this.nominatimService.search(query).subscribe(results => {
      this.searchResults = results;
    });
  }

  reverseGeocode(lat: string, lon: string) {
    const latNumber = parseFloat(lat);
    const lonNumber = parseFloat(lon);

    // Utilizza il metodo reverse del servizio Nominatim
    this.nominatimService.reverse(latNumber, lonNumber).subscribe(result => {
      this.searchResults = [result];
    });
  }

  centerMapOnResult(result: any): void {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Se ci sono marker nell'array, rimuovi l'ultimo aggiunto dalla mappa
    if (this.currentMarkers.length > 0) {
      this.map.removeLayer(this.currentMarkers.pop());
    }

    // Centra la mappa sul risultato selezionato
    this.map.flyTo([lat, lon], 10);

    // Aggiungi un marker al risultato selezionato
    const marker = L.marker([lat, lon]);
    marker.addTo(this.map);

    // Aggiungi un popup al marker con un pulsante
    const popupContent = `
      <button id="add-point-button" class="p-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        ADD POINT
      </button>
    `;
    marker.bindPopup(popupContent);

    // Aggiungi l'ascoltatore dell'evento 'popupopen' al marker
    marker.on('popupopen', (event) => {
      this.handleAddPointButtonClick();
    });
    
    // Aggiungi il marker all'array di marker
    this.currentMarkers.push(marker);
  }

  ngAfterViewInit(): void {
    this.initMap();
  
    // Carica tutti i punti dal backend dopo l'inizializzazione della mappa
    this.markerService.getAllPoints().subscribe((points: any) => {
      for (let point of points) {
        this.createAndConfigureMarker([point.latitude, point.longitude], point.person.username, point.id);
      }
    });
  }

}
