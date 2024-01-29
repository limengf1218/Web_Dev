import {
  ActionIcon,
  Group,
  Input,
  InputWrapperProps,
  Progress,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { Dropzone, DropzoneProps, FileWithPath } from '@mantine/dropzone';
import { useDidUpdate, useListState } from '@mantine/hooks';
import { IconFile, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useS3Upload } from '~/hooks/useS3Upload';
import { BaseFileSchema } from '~/server/schema/file.schema';
import { removeDuplicates } from '~/utils/array-helpers';
import { bytesToKB, formatBytes, formatSeconds } from '~/utils/number-helpers';

type Props = Omit<InputWrapperProps, 'children' | 'onChange'> & {
  value?: BaseFileSchema[];
  onChange?: (value: BaseFileSchema[]) => void;
  dropzoneProps?: Omit<DropzoneProps, 'onDrop' | 'children'>;
  renderItem?: (file: BaseFileSchema) => React.ReactNode;
};

export function MultiFileInputUpload({
  value,
  onChange,
  dropzoneProps,
  renderItem,
  ...props
}: Props) {
  const theme = useMantineTheme();
  const { uploadToS3, files: trackedFiles } = useS3Upload();
  const { t } = useTranslation();
  const [files, filesHandlers] = useListState<BaseFileSchema>(value || []);
  const [errors, setErrors] = useState<string[]>([]);

  const handleDrop = async (droppedFiles: FileWithPath[]) => {
    setErrors([]);

    if (dropzoneProps?.maxFiles && files.length + droppedFiles.length > dropzoneProps.maxFiles) {
      setErrors(['Max files exceeded']);
      return;
    }

    const uploadedFiles = await Promise.all(
      droppedFiles.map((file) => uploadToS3(file, 'default'))
    );
    const successUploads = uploadedFiles
      .filter(({ url }) => !!url)
      .map((upload) => ({
        url: upload.url as string,
        name: upload.name ?? '',
        sizeKB: upload.size ? bytesToKB(upload.size) : 0,
      }));
    filesHandlers.append(...successUploads);
  };

  const handleRemove = (index: number) => {
    filesHandlers.remove(index);
    onChange?.(files.slice(0, index).concat(files.slice(index + 1)));
  };

  useDidUpdate(() => {
    if (files && files.length) onChange?.(files);
  }, [files]);

  const uploadingItems = trackedFiles.filter((file) => file.status === 'uploading');
  const hasErrors = errors.length > 0;

  return (
    <Stack>
      <Input.Wrapper
        {...props}
        error={errors.length > 0 ? errors[0] : props.error}
        description={
          dropzoneProps?.maxFiles
            ? `${files.length}/${dropzoneProps.maxFiles} uploaded files`
            : props.description
        }
      >
        <Dropzone
          {...dropzoneProps}
          mt={5}
          onDrop={handleDrop}
          onReject={(files) => {
            const errors = removeDuplicates(
              files.flatMap((file) => file.errors),
              'code'
            ).map((error) => error.message);
            setErrors(errors);
          }}
          styles={(theme) => ({
            root:
              !!props.error || hasErrors
                ? {
                    borderColor: theme.colors.red[6],
                    marginBottom: theme.spacing.xs / 2,
                  }
                : undefined,
          })}
        >
          <Dropzone.Accept>
            <Group position="center" spacing="xs">
              <IconUpload
                size={32}
                stroke={1.5}
                color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
              />
              <Text>{t('Drop your files here')}</Text>
            </Group>
          </Dropzone.Accept>
          <Dropzone.Reject>
            <Group position="center" spacing="xs">
              <IconX
                size={32}
                stroke={1.5}
                color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
              />
              <Text>{t('File not accepted')}</Text>
            </Group>
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Group position="center" spacing="xs">
              <IconFile size={32} stroke={1.5} />
              <Stack spacing={0}>
                <Text>{t('Drop your files here or click to select')}</Text>
                <Text color="dimmed" size="xs">
                  {`Each file should not exceed ${formatBytes(dropzoneProps?.maxSize ?? 0)}`}
                </Text>
              </Stack>
            </Group>
          </Dropzone.Idle>
        </Dropzone>
      </Input.Wrapper>
      <Stack spacing={8}>
        {files.map((file, index) => (
          <Group key={file.id ?? file.url} spacing={8} position="apart" noWrap>
            {renderItem ? (
              renderItem(file)
            ) : (
              <Text size="sm" weight={500} lineClamp={1}>
                {file.name}
              </Text>
            )}
            <Tooltip label="Remove">
              <ActionIcon
                size="sm"
                color="red"
                variant="transparent"
                onClick={() => handleRemove(index)}
              >
                <IconTrash />
              </ActionIcon>
            </Tooltip>
          </Group>
        ))}
        {uploadingItems.map((file, index) => (
          <UploadItem key={index} {...file} />
        ))}
      </Stack>
    </Stack>
  );
}

type UploadItemProps = Pick<TrackedFile, 'progress' | 'speed' | 'timeRemaining' | 'abort' | 'name'>;
function UploadItem({ progress, speed, timeRemaining, abort, name }: UploadItemProps) {
  return (
    <Stack spacing={4}>
      <Group spacing={8} position="apart" noWrap>
        <Text size="sm" weight={500} lineClamp={1}>
          {name}
        </Text>
        <Tooltip label="Cancel">
          <ActionIcon size="sm" color="red" variant="transparent" onClick={() => abort()}>
            <IconX />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Stack spacing={2}>
        <Progress
          sx={{ width: '100%' }}
          size="xl"
          value={progress}
          label={`${Math.floor(progress)}%`}
          color={progress < 100 ? 'blue' : 'green'}
          striped
          animate
        />
        <Group position="apart">
          <Text size="xs" color="dimmed">{`${formatBytes(speed)}/s`}</Text>
          <Text size="xs" color="dimmed">{`${formatSeconds(timeRemaining)} remaining`}</Text>
        </Group>
      </Stack>
    </Stack>
  );
}
