import { SkeletonTable } from '@/components/ui/Skeleton';

export default function ReservationsLoading() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          height: '40px',
          width: '250px',
          background: 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
          borderRadius: '8px',
        }} />
        <div style={{
          height: '40px',
          width: '150px',
          background: 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
          borderRadius: '8px',
        }} />
      </div>

      <SkeletonTable rows={10} />
    </div>
  );
}
