import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

type Artwork = {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
};

const App = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map<number, Artwork>>(new Map());
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [showSelector, setShowSelector] = useState(false);
  const [selectCount, setSelectCount] = useState('');

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}`
      );
      const data = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const onPageChange = (e: any) => {
    setPage(e.page);
  };

  const onSelectionChange = (e: any) => {
    const newSelected: Artwork[] = e.value;
    const newMap = new Map(selectedMap);

    for (let item of newSelected) {
      newMap.set(item.id, item);
    }

    for (let row of artworks) {
      if (!newSelected.some((item: Artwork) => item.id === row.id)) {
        newMap.delete(row.id);
      }
    }

    setSelectedMap(newMap);
  };

  const currentPageSelection = artworks.filter((art) => selectedMap.has(art.id));
  const selectedArtworksArray = Array.from(selectedMap.values());

  const clearSelection = () => {
    setSelectedMap(new Map());
  };

  return (
    <div className="flex">
      {/* Main Table */}
      <div className="w-3/4 p-4">
        <h2 className="text-2xl mb-4">Artworks (Persistent Selection)</h2>

        <DataTable
          value={artworks}
          lazy
          loading={loading}
          paginator
          rows={rows}
          onPage={onPageChange}
          totalRecords={totalRecords}
          first={page * rows}
          selection={currentPageSelection}
          onSelectionChange={onSelectionChange}
          selectionMode="checkbox"
          dataKey="id"
          rowsPerPageOptions={[10, 20, 50]}
          onRowsChange={(e) => setRows(e.value)}
        >
          {/* ✅ Custom header for selection icon + floating form */}
          <Column
            selectionMode="multiple"
            header={() => (
              <div style={{ position: 'relative' }}>
                <i
                  className="pi pi-angle-down"
                  title="Select rows"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowSelector(!showSelector)}
                />

                {showSelector && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '-20px',
                      backgroundColor: 'white',
                      border: '1px solid gray',
                      borderRadius: '4px',
                      padding: '5px',
                      zIndex: 9999,
                      width: '120px',
                    }}
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const count = parseInt(selectCount);
                        if (!isNaN(count) && count > 0) {
                          const rowsToSelect = artworks.slice(0, count);
                          const newMap = new Map(selectedMap);
                          rowsToSelect.forEach((art) => newMap.set(art.id, art));
                          setSelectedMap(newMap);
                          setShowSelector(false);
                          setSelectCount('');
                        }
                      }}
                    >
                      <input
                        type="number"
                        placeholder="Select rows..."
                        style={{ width: '100%', fontSize: '12px', marginBottom: '4px' }}
                        min={1}
                        max={artworks.length}
                        value={selectCount}
                        onChange={(e) => setSelectCount(e.target.value)}
                      />
                      <button
                        type="submit"
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          width: '100%',
                          backgroundColor: '#000',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                        }}
                      >
                        submit
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
            headerStyle={{ width: '6rem' }}
            style={{ textAlign: 'center' }}
          />

          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="artist_display" header="Artist" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Start Date" />
          <Column field="date_end" header="End Date" />
        </DataTable>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/4 p-4 bg-gray-100 border-l h-screen overflow-y-auto">
        <h3 className="text-xl mb-2">Selected Artworks</h3>
        {selectedArtworksArray.length === 0 ? (
          <p className="text-sm text-gray-600">No artworks selected.</p>
        ) : (
          <ul className="space-y-2">
            {selectedArtworksArray.map((art) => (
              <li key={art.id} className="p-2 border rounded bg-white shadow-sm">
                <p className="font-semibold">{art.title}</p>
                <p className="text-sm text-gray-700">{art.artist_display}</p>
              </li>
            ))}
          </ul>
        )}

        {selectedArtworksArray.length > 0 && (
          <button
            className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={clearSelection}
          >
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
