import React, { useMemo } from 'react';
import Select from 'react-select';

import api from './api';
import { legacyMetricNameToNameAndDataType } from './utils';

export default function MetricTagValueSelect({
  metricName,
  metricAttribute,
  value,
  onChange,
  dropdownOpenWidth,
  dropdownClosedWidth,
  ...selectProps
}: {
  metricName: string;
  metricAttribute: string;
  value: string;
  dropdownOpenWidth?: number;
  dropdownClosedWidth?: number;
  onChange: (value: string) => void;
} & Partial<React.ComponentProps<typeof Select>>) {
  const [pagination, setPagination] = React.useState({
    page: 0,
    limit: 20,
    hasMore: true,
  });
  const { name: mName, dataType: mDataType } =
    legacyMetricNameToNameAndDataType(metricName);
  const { data: metricTagsData, isLoading: isMetricTagsLoading } =
    api.useMetricsTags(
      [
        {
          name: mName,
          dataType: mDataType,
        },
      ],
      pagination.page,
      pagination.limit,
    );

  const options = useMemo(() => {
    const tags =
      metricTagsData?.data?.filter(metric => metric.name === metricName)?.[0]
        ?.tags ?? [];
    const tagNameValueSet = new Set<string>();
    tags.forEach(tag => {
      Object.entries(tag).forEach(([name, value]) =>
        tagNameValueSet.add(`${name}:"${value}"`),
      );
    });
    return Array.from(tagNameValueSet).map(tagName => ({
      value: tagName,
      label: tagName,
      options: [],
    }));
  }, [metricTagsData, metricName]);

  return (
    <Select
      value={value}
      onMenuScrollToBottom={() => {
        if (pagination.hasMore) {
          setPagination({
            ...pagination,
            page: pagination.page + 1,
          });
        }
      }}
      onChange={onChange}
      isLoading={isMetricTagsLoading}
      maxMenuHeight={280}
      options={options}
      className="ds-select"
      classNamePrefix="ds-react-select"
    />
  );
}
