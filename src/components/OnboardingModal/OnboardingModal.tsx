import { useTranslation } from 'react-i18next';
import {
  Button,
  Stack,
  Text,
  Alert,
  Title,
  Group,
  Center,
  Container,
  Loader,
  createStyles,
  StackProps,
  ThemeIcon,
  Modal,
  Stepper,
  Checkbox,
} from '@mantine/core';
import { SetStateAction, useState } from 'react';
import { z } from 'zod';
import { Form, InputText, useForm } from '~/libs/form';
import { trpc } from '~/utils/trpc';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { Logo } from '~/components/Logo/Logo';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { invalidateModeratedContent } from '~/utils/query-invalidation-utils';
import OnboardingModalCompenent from '~/components/OnboardingModal/OnboardingModalCompenent';
import OnboardingModalCompenent2 from '~/components/OnboardingModal/OnboardingModalCompenent2';

const schema = z.object({
  username: z
    .string()
    .min(3, '您的用户名必须至少包含 3 个字符')
    .regex(/^[\u4e00-\u9fa5A-Za-z0-9_]*$/, '用户名只能包含中文、字母、数字和_'),
  email: z
    .string({
      invalid_type_error: '请输入电子邮件',
      required_error: '请输入电子邮件',
    })
    .email(),
});

export default function OnboardingModal() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const utils = trpc.useContext();
  const [isChecked, setIsChecked] = useState(false);
  const form = useForm({
    schema,
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { ...user },
  });
  const username = form.watch('username');
  const [debounced] = useDebouncedValue(username, 300);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalOpen2, setModalOpen2] = useState(false);
  // Check if username is available
  const { data: usernameAvailable, isRefetching: usernameAvailableLoading } =
    trpc.user.usernameAvailable.useQuery(
      { username: debounced },
      { enabled: !!username && username.length >= 3 }
    );
  const { classes } = useStyles();
  const onboarded = {
    tos: !!user?.tos,
    profile: !!user?.username || !!user?.email,
    content: !!user?.onboarded,
  };
  const [activeStep, setActiveStep] = useState(Object.values(onboarded).indexOf(false));
  const [active, setActive] = useState(0);
  const [highestStepVisited, setHighestStepVisited] = useState(active);

  // Allow the user to freely go back and forth between visited steps.
  const shouldAllowSelectStep = (step: number) => highestStepVisited >= step && active !== step;
  const { mutate, isLoading, error } = trpc.user.update.useMutation();
  const { mutate: completeOnboarding, isLoading: completeOnboardingLoading } =
    trpc.user.completeOnboarding.useMutation({
      async onSuccess() {
        user?.refresh();
        await invalidateModeratedContent(utils);
        // context.closeModal(id);
      },
    });
  const handleCompleteOnboarding = () => {
    completeOnboarding();
  };
  const handleSubmit = (values: z.infer<typeof schema>) => {
    if (!user) return;
    // TOS is true here because it was already accepted
    mutate(
      { ...user, ...values, tos: true },
      {
        onSuccess: async () => {
          setActiveStep((x) => x + 1);
        },
      }
    );
  };

  const options1 = [
    { value: 'option1', label: 'A. Super Dragon (七龙珠) ' },
    { value: 'option2', label: 'B. Shan Dong Province (山东省) ' },
    { value: 'option3', label: 'C. Stable Diffusion' },
  ];

  const options2 = [
    { value: 'option1', label: 'A. 古墓丽影里的女主角 ' },
    { value: 'option2', label: 'B. 远距离无线电通信技术 ' },
    { value: 'option3', label: 'C. 一种小型微调模型' },
  ];

  const options3 = [
    { value: 'option1', label: 'A. 《鬼灭之刃》 ' },
    { value: 'option2', label: 'B. 《Genshin》 ' },
    { value: 'option3', label: 'C. 《你的名字》' },
    { value: 'option4', label: 'D.    以上均是' },
  ];

  const [selectedOptions, setSelectedOptions] = useState<Record<number, string | undefined>>({});
  const [showPopups, setShowPopups] = useState<Record<number, boolean>>({});

  const handleOptionChange = (stepIndex: number, optionValue: string) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [stepIndex]: optionValue,
    }));
  };
  const handleStepChange = (stepIndex: number) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [stepIndex]: undefined,
    }));
    setShowPopups((prevShowPopups) => ({
      ...prevShowPopups,
      [stepIndex]: false,
    }));
    setActive(stepIndex);
  };

  return (
    <Container size="lg" px={0}>
      <Center>
        <Group spacing="xs">
          <Stack spacing={20} mt={-5}>
            <Logo />
            <Title sx={{ lineHeight: 1 }}></Title>
            <Text></Text>
          </Stack>
        </Group>
      </Center>

      <Stack>
        <Modal size="xl" opened={isModalOpen} onClose={() => setModalOpen(false)}>
          <OnboardingModalCompenent />
        </Modal>
        <Modal size="xl" opened={isModalOpen2} onClose={() => setModalOpen2(false)}>
          <OnboardingModalCompenent2 />
        </Modal>

        <Container size="xs" px={0}>
          <Stepper
            active={activeStep}
            color="green"
            allowNextStepsSelect={false}
            classNames={classes}
          >
            <Stepper.Step label="账号及条款" description="阅读同意条款">
              <Stack>
                <StepperTitle
                  title={t('Account Details')}
                  description={t('Please verify your account details')}
                />
                <Form form={form} onSubmit={handleSubmit}>
                  <Stack>
                    <Stack spacing={50}>
                      {!user?.email && (
                        <InputText name="email" label="Email" size="lg" type="email" withAsterisk />
                      )}
                      <InputText
                        size="lg"
                        name="username"
                        label={t('Username') as string}
                        clearable={false}
                        rightSection={
                          usernameAvailableLoading ? (
                            <Loader size="sm" mr="xs" />
                          ) : (
                            usernameAvailable !== undefined && (
                              <ThemeIcon
                                variant="outline"
                                color={!!username && usernameAvailable ? 'green' : 'red'}
                                radius="xl"
                                mr="xs"
                              >
                                {!!username && usernameAvailable ? (
                                  <IconCheck size="1.25rem" />
                                ) : (
                                  <IconX size="1.25rem" />
                                )}
                              </ThemeIcon>
                            )
                          )
                        }
                        withAsterisk
                      />
                      {error && (
                        <Alert color="red" variant="light">
                          {error.data?.code === 'CONFLICT'
                            ? t('That username is already taken')
                            : error.message}
                        </Alert>
                      )}

                      <Button
                        disabled={
                          // !usernameAvailable ||
                          !username ||
                          !isChecked ||
                          usernameAvailableLoading ||
                          !(form.formState.isValid || !form.formState.isDirty)
                        }
                        size="lg"
                        type="submit"
                        loading={isLoading}
                      >
                        {t('Submit')}
                      </Button>
                    </Stack>
                  </Stack>
                </Form>
                <Group spacing="xs">
                  <Checkbox
                    checked={isChecked}
                    onChange={(event) => setIsChecked(event.currentTarget.checked)}
                    label={t('I have read and agree to')}
                  />
                  <Button variant="subtle" size="sm" onClick={() => setModalOpen(true)} compact>
                    {t('[Terms of Service]')}
                  </Button>
                  <Text style={{ fontSize: '14px' }}>{t('and')}</Text>
                  <Button variant="subtle" size="sm" onClick={() => setModalOpen2(true)} compact>
                    {t('[Privacy Policy]')}
                  </Button>
                </Group>
              </Stack>
            </Stepper.Step>
            <Stepper.Step label="注册考试" description="该部分总3题，需全部答对才可以完成注册">
              <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                <Stepper.Step
                  label="第一题"
                  description="1/3"
                  allowStepSelect={shouldAllowSelectStep(1)}
                >
                  <div>
                    <p>sd1.5 里的sd全称是什么：</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {options1.map((option) => (
                        <Button
                          key={option.value}
                          style={{
                            marginBottom: '10px',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            backgroundColor:
                              selectedOptions[1] === option.value ? '#007bff' : '#cccccc',
                            color: selectedOptions[1] === option.value ? '#ffffff' : '#000000',
                          }}
                          onClick={() => {
                            handleOptionChange(1, option.value);
                            setShowPopups((prevShowPopups) => ({
                              ...prevShowPopups,
                              1: option.value !== 'option3',
                            }));
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    {showPopups[1] && (
                      <div style={{ color: 'red' }}>
                        *SD是一种潜空间扩散模型（Latent Diffusion
                        Model），能够从文本描述中生成详细的图像。
                      </div>
                    )}
                  </div>
                  <Button
                    disabled={selectedOptions[1] !== 'option3'}
                    onClick={() => handleStepChange(active + 1)}
                  >
                    下一题
                  </Button>
                </Stepper.Step>

                <Stepper.Step
                  label="第二题"
                  description="2/3"
                  allowStepSelect={shouldAllowSelectStep(2)}
                >
                  <div>
                    <p>通常我们说的lora是什么？</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {options2.map((option) => (
                        <Button
                          key={option.value}
                          style={{
                            marginBottom: '10px',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            backgroundColor:
                              selectedOptions[2] === option.value ? '#007bff' : '#cccccc',
                            color: selectedOptions[2] === option.value ? '#ffffff' : '#000000',
                          }}
                          onClick={() => {
                            handleOptionChange(2, option.value);
                            setShowPopups((prevShowPopups) => ({
                              ...prevShowPopups,
                              1: option.value !== 'option3',
                            }));
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    {showPopups[1] && (
                      <div style={{ color: 'red' }}>
                        *Lora利用少量数据训练出一种画风/IP/人物，实现定制化需求。
                      </div>
                    )}
                  </div>
                  <Button
                    disabled={selectedOptions[2] !== 'option3'}
                    onClick={() => handleStepChange(active + 1)}
                  >
                    下一题
                  </Button>
                </Stepper.Step>

                <Stepper.Step
                  label="第三题"
                  description="3/3"
                  allowStepSelect={shouldAllowSelectStep(3)}
                >
                  <div>
                    <p>提到miko，和下面哪部作品或游戏的女性角色相关？</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {options3.map((option) => (
                        <Button
                          key={option.value}
                          style={{
                            marginBottom: '10px',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            backgroundColor:
                              selectedOptions[3] === option.value ? '#007bff' : '#cccccc',
                            color: selectedOptions[3] === option.value ? '#ffffff' : '#000000',
                          }}
                          onClick={() => {
                            handleOptionChange(3, option.value);
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    {showPopups[1] && (
                      <div style={{ color: 'red' }}>
                        *miko是日本的神社巫女，在许多日本动漫、漫画和游戏作品中都有miko这一角色设定。
                      </div>
                    )}
                  </div>
                  <Button
                    disabled={
                      !selectedOptions[3] ||
                      !username ||
                      !isChecked ||
                      usernameAvailableLoading ||
                      !(form.formState.isValid || !form.formState.isDirty)
                    }
                    size="lg"
                    type="submit"
                    style={{ height: '45px', width: '540px' }}
                    onClick={handleCompleteOnboarding}
                    loading={completeOnboardingLoading}
                  >
                    {t('Submit')}
                  </Button>
                </Stepper.Step>
              </Stepper>
            </Stepper.Step>
          </Stepper>
        </Container>
      </Stack>
    </Container>
  );
}

const StepperTitle = ({
  title,
  description,
  ...props
}: { title: React.ReactNode; description: React.ReactNode } & Omit<StackProps, 'title'>) => {
  return (
    <Stack spacing={4} {...props}>
      <Title order={3} sx={{ lineHeight: 1.1 }}>
        {title}
      </Title>
      <Text>{description}</Text>
    </Stack>
  );
};

const useStyles = createStyles((theme, _params, getRef) => ({
  steps: {
    marginTop: 20,
    marginBottom: 20,
    [theme.fn.smallerThan('xs')]: {
      marginTop: 0,
      marginBottom: 0,
    },
  },
  step: {
    [theme.fn.smallerThan('xs')]: {
      '&[data-progress]': {
        display: 'flex',
        [`& .${getRef('stepBody')}`]: {
          display: 'block',
        },
      },
    },
  },
  stepBody: {
    ref: getRef('stepBody'),
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
  stepDescription: {
    whiteSpace: 'nowrap',
  },
  separator: {
    [theme.fn.smallerThan('xs')]: {
      marginLeft: 4,
      marginRight: 4,
      minWidth: 10,
      // display: 'none',
    },
  },
}));
