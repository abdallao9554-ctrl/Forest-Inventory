import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Calendar, User, Trees } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface PermitLocation {
    id: string
    permitNumber: string
    applicant: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
    issueDate: string
    expiryDate: string
    areaHa: number
    treeCount: number
    lat: number
    lng: number
}

interface PermitMarkerProps {
    permit: PermitLocation
}

// Custom marker icons based on permit status
const getPermitIcon = (status: PermitLocation['status']) => {
    const colorMap = {
        APPROVED: '#22c55e',    // green
        PENDING: '#eab308',     // yellow
        REJECTED: '#ef4444',    // red
        EXPIRED: '#94a3b8'      // gray
    }

    const color = colorMap[status]

    return L.divIcon({
        html: `
            <div style="
                background-color: ${color};
                width: 28px;
                height: 28px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
                <div style="
                    transform: rotate(45deg);
                    margin-top: 2px;
                    margin-left: 2px;
                ">
                </div>
            </div>
        `,
        className: 'custom-permit-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    })
}

const getStatusVariant = (status: PermitLocation['status']): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
        case 'APPROVED': return 'default'
        case 'PENDING': return 'secondary'
        case 'REJECTED': return 'destructive'
        case 'EXPIRED': return 'outline'
        default: return 'default'
    }
}

export function PermitMarker({ permit }: PermitMarkerProps) {
    return (
        <Marker
            position={[permit.lat, permit.lng]}
            icon={getPermitIcon(permit.status)}
        >
            <Popup>
                <div className="min-w-[250px] space-y-3 p-2">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-base">{permit.permitNumber}</h3>
                            <Badge variant={getStatusVariant(permit.status)}>
                                {permit.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <div className="text-muted-foreground text-xs">Applicant</div>
                                <div className="font-medium">{permit.applicant}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <div className="text-muted-foreground text-xs">Issue Date</div>
                                <div>{new Date(permit.issueDate).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <div className="text-muted-foreground text-xs">Expiry Date</div>
                                <div>{new Date(permit.expiryDate).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <div className="text-muted-foreground text-xs">Area</div>
                                <div>{permit.areaHa} hectares</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Trees className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <div className="text-muted-foreground text-xs">Trees</div>
                                <div>{permit.treeCount.toLocaleString()} trees</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    )
}
