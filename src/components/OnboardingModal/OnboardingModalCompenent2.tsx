import { Stack, Title, Center, Container, ScrollArea, Loader } from '@mantine/core';
import { trpc } from '~/utils/trpc';
import { useCurrentUser } from '~/hooks/useCurrentUser';

export default function OnboardingModalCompenent2() {
  const user = useCurrentUser();
  const onboarded = {
    tos: !!user?.tos,
    profile: !!user?.username || !!user?.email,
    content: !!user?.onboarded,
  };

  const { data: terms, isLoading: termsLoading } = trpc.content.get.useQuery(
    { slug: 'tos' },
    { enabled: !onboarded.tos }
  );

  return (
    <Container size="lg" px={0}>
      <Stack>
        <ScrollArea style={{ height: '75vh' }} p="md">
          {termsLoading || !terms ? (
            <Center py="lg">
              <Loader size="lg" />
            </Center>
          ) : (
            <>
              <Title order={1}>隐私条款</Title>
              <br />
              <div>
                我们仅收集为我们网站正常运行所必需的个人信息，例如姓名和电子邮件地址。这些信息仅用于提供用户所请求的服务，并不与任何外部方共享。
                <br />
                <br />
                我们采取适当的安全措施，以防止未经授权访问、未经授权的更改、披露或销毁数据。这些措施包括实施物理、电子和管理程序，以保护和确保我们收集的信息的安全性。
                <br />
                <br />
                我们可能会使用第三方服务提供商来协助我们运营业务和网站，或代表我们进行活动，例如发送电子邮件或分析数据。我们可能会与这些第三方分享您的个人信息，但仅限于这些有限的目的，并且仅在您已经同意的情况下。
                <br />
                <br />
                Mikomiko不对我们网站上可能链接到的任何第三方网站的隐私政策或实践负责。我们鼓励用户在共享任何个人信息之前阅读这些网站的隐私政策。
                <br />
                <br />
                如果您对我们的隐私政策有任何疑问，请与我们联系。
              </div>
            </>
          )}
        </ScrollArea>
      </Stack>
    </Container>
  );
}
