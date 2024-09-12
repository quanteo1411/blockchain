import React, { Component } from 'react';
import { useSnackbar } from 'notistack';

// Class component ErrorBoundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.props.showSnackbar('Đã xảy ra lỗi! Vui lòng thử lại sau.', 'error');
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Nhìn gì mà nhìn, fix bugs đi.</h1>;
    }

    return this.props.children;
  }
}

// HOC để bọc ErrorBoundary với useSnackbar
const withSnackbar = (Component) => (props) => {
  const { enqueueSnackbar } = useSnackbar();

  const showSnackbar = (message, variant) => {
    enqueueSnackbar(message, { variant });
  };

  return <Component {...props} showSnackbar={showSnackbar} />;
};

const ErrorBoundaryWithSnackbar = withSnackbar(ErrorBoundary);

export default ErrorBoundaryWithSnackbar;
