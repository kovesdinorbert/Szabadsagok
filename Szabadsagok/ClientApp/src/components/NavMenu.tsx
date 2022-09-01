import React from 'react';
import { Menubar } from 'primereact/menubar';
import { InputText } from 'primereact/inputtext';

export default function NavMenu() {
    const items = [
        {
            label: 'Nyitólap',
            icon: 'pi pi-fw pi-calendar',
            url: '/'
        },
        {
            label: 'Új szabadság',
            icon: 'pi pi-fw pi-pencil',
            url: '/request'
        },
        {
            label: 'Felhasználók',
            icon: 'pi pi-fw pi-user',
            url: '/users'
        },
        {
            label: 'Év konfigurálás',
            icon: 'pi pi-fw pi-calendar-times',
            url: '/configyear'
        },
        {
            label: 'Temp login',
            icon: 'pi pi-fw pi-power-off',
            url: '/login'
        }
    ];

    const start = <label className="mr-2">Szabadság app</label>;

    return (
        <div>
            <div className="card">
                <Menubar model={items} start={start}/>
            </div>
        </div>
    );
}
