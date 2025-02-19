{
  /* Phần nội dung Dashboard */
}
<div className="admin-content">
  <div className="admin-header">
    <h2>Lorem Ipsum</h2>
  </div>

  <div className="admin-charts">
    {/* Chart lớn */}
    <div className="chart-large">
      <ChartCard
        title="Annual Sales Performance"
        amount="127,092.22"
        data={chartData}
      />
    </div>

    {/* 2 chart nhỏ phía dưới */}
    <div className="chart-row">
      <ChartCard
        title="Annual Sales Performance"
        amount="127,092.22"
        data={chartData}
      />
      <ChartCard
        title="Annual Sales Performance"
        amount="127,092.22"
        data={chartData}
      />
    </div>
  </div>
</div>;
