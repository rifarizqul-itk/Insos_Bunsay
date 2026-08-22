import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-white rounded-xl border border-red/20 shadow-sm text-center flex flex-col items-center justify-center gap-4 my-8">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-text">Terjadi Kendala Memuat Halaman</h2>
          <p className="text-sm text-text-2 max-w-md">
            {this.state.error?.message || 'Gagal memuat komponen halaman ini. Silakan coba muat ulang halaman.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-red text-white text-sm font-bold rounded-lg hover:bg-red/90 transition-colors cursor-pointer"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
